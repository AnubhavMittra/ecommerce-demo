package cart

import (
	"database/sql"
	"backend/types"
)

type CartStore struct {
	db *sql.DB
}

func NewCartStore(db *sql.DB) *CartStore {
	return &CartStore{db: db}
}

func (s *CartStore) GetCartByUserID(userID int) (*types.Cart, error) {
	cart := &types.Cart{UserID: userID, Items: []types.CartItem{}}
	row := s.db.QueryRow("SELECT id FROM carts WHERE user_id = ?", userID)
	if err := row.Scan(&cart.ID); err != nil {
		if err == sql.ErrNoRows {
			return cart, nil 
		}
		return nil, err
	}
	rows, err := s.db.Query(`SELECT ci.id, ci.product_id, p.name, p.price, p.image_url, ci.quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?`, cart.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var item types.CartItem
		if err := rows.Scan(&item.ID, &item.ProductID, &item.Title, &item.Price, &item.Image, &item.Quantity); err != nil {
			return nil, err
		}
		cart.Items = append(cart.Items, item)
	}
	return cart, nil
}

func (s *CartStore) AddToCart(userID, productID, quantity int) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var cartID int
	err = tx.QueryRow("SELECT id FROM carts WHERE user_id = ?", userID).Scan(&cartID)
	if err == sql.ErrNoRows {
		res, err := tx.Exec("INSERT INTO carts (user_id) VALUES (?)", userID)
		if err != nil {
			return err
		}
		lastID, err := res.LastInsertId()
		if err != nil {
			return err
		}
		cartID = int(lastID)
	} else if err != nil {
		return err
	}
	var existingQty int
	err = tx.QueryRow("SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?", cartID, productID).Scan(&existingQty)
	if err == sql.ErrNoRows {
		_, err = tx.Exec("INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, (SELECT price FROM products WHERE id = ?))", cartID, productID, quantity, productID)
		if err != nil {
			return err
		}
	} else if err == nil {
		_, err = tx.Exec("UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?", quantity, cartID, productID)
		if err != nil {
			return err
		}
	} else {
		return err
	}
	return tx.Commit()
}

func (s *CartStore) RemoveFromCart(userID, productID int) error {
	var cartID int
	err := s.db.QueryRow("SELECT id FROM carts WHERE user_id = ?", userID).Scan(&cartID)
	if err != nil {
		return err
	}
	_, err = s.db.Exec("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", cartID, productID)
	return err
}

func (s *CartStore) ClearCart(userID int) error {
	var cartID int
	err := s.db.QueryRow("SELECT id FROM carts WHERE user_id = ?", userID).Scan(&cartID)
	if err != nil {
		return err
	}
	_, err = s.db.Exec("DELETE FROM cart_items WHERE cart_id = ?", cartID)
	return err
}
