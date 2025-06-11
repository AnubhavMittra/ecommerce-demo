package user

import (
	"database/sql"
	"fmt"

	"backend/types"
)

type Store struct {
	db *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{
		db: db,
	}
}

func (s *Store) GetUserByEmail(email string) (*types.User, error) {
	fmt.Println("Getting user by email:", email)
	rows, err := s.db.Query("SELECT * FROM users WHERE email = ?", email)
	if err != nil {
		return nil, err
	}
	fmt.Println("Query successful:", "SELECT * FROM users WHERE email = ?", email)
	u := new(types.User)
	for rows.Next() {
		u, err = scanRowsIntoUser(rows)
		if err != nil {
			return nil, err
		}
	}

	if u.ID == 0 {
		return nil, fmt.Errorf("user not found")
	}

	return u, nil
}

func (s *Store) CreateUser(user *types.User) error {
	query := "INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)"
	_, err := s.db.Exec(query, user.FirstName, user.LastName, user.Email, user.Password)
	if err != nil {
		return err
	}
	return nil
}

func (s *Store) GetUserById(id int) (*types.User, error) {
	query := "SELECT * FROM users WHERE id = ?"
	rows, err := s.db.Query(query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	u := new(types.User)
	for rows.Next() {
		u, err = scanRowsIntoUser(rows)
		if err != nil {
			return nil, err
		}
	}

	if u.ID == 0 {
		return nil, fmt.Errorf("user with id %d not found", id)
	}
	return u, nil
}

func scanRowsIntoUser(rows *sql.Rows) (*types.User, error) {
	user := new(types.User)
	var updatedAt sql.NullTime
	err := rows.Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
		&updatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}
