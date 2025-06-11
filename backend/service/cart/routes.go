package cart

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"backend/service/auth"
	"backend/types"
	"backend/utils"
)

type Handler struct {
	store      types.ProductStore
	orderStore types.OrderStore
	userStore  types.UserStore
	cartStore  types.CartStore
}

func NewHandler(
	store types.ProductStore,
	orderStore types.OrderStore,
	userStore types.UserStore,
	cartStore types.CartStore,
) *Handler {
	return &Handler{
		store:      store,
		orderStore: orderStore,
		userStore:  userStore,
		cartStore:  cartStore,
	}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/checkout", auth.WithJWTAuth(h.handleCheckout, h.userStore)).Methods(http.MethodPost)
	router.HandleFunc("/cart", auth.WithJWTAuth(h.handleGetCart, h.userStore)).Methods(http.MethodGet)
	router.HandleFunc("/cart", auth.WithJWTAuth(h.handleAddToCart, h.userStore)).Methods(http.MethodPost)
	router.HandleFunc("/cart/{id}", auth.WithJWTAuth(h.handleRemoveFromCart, h.userStore)).Methods(http.MethodDelete)
	router.HandleFunc("/cart", auth.WithJWTAuth(h.handleClearCart, h.userStore)).Methods(http.MethodDelete)
}

func (h *Handler) handleCheckout(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	var cart types.CartCheckoutPayload
	if err := utils.ParseJSON(r, &cart); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	if err := utils.Validate.Struct(cart); err != nil {
		errors := err.(validator.ValidationErrors)
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid payload: %v", errors))
		return
	}

	productIds, err := getCartItemsIDs(cart.Items)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	products, err := h.store.GetProductsById(productIds)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	orderID, totalPrice, err := h.createOrder(products, cart.Items, userID)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"total_price": totalPrice,
		"order_id":    orderID,
	})
}

func (h *Handler) handleGetCart(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())
	cart, err := h.cartStore.GetCartByUserID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"cart": cart.Items,
	})
}

func (h *Handler) handleAddToCart(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())
	var item struct {
		ProductID int `json:"id"`
		Quantity  int `json:"quantity"`
	}
	if err := utils.ParseJSON(r, &item); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if item.Quantity <= 0 {
		item.Quantity = 1
	}
	err := h.cartStore.AddToCart(userID, item.ProductID, item.Quantity)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Added to cart"})
}

func (h *Handler) handleRemoveFromCart(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())
	vars := mux.Vars(r)
	idStr := vars["id"]
	productID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	err = h.cartStore.RemoveFromCart(userID, productID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Removed from cart"})
}

func (h *Handler) handleClearCart(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())
	err := h.cartStore.ClearCart(userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Cart cleared"})
}