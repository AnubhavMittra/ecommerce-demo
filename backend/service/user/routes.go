package user

import (
	"fmt"
	"net/http"

	"backend/config"
	"backend/service/auth"
	"backend/types"
	"backend/utils"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
)

type Handler struct {
	store types.UserStore
}

func NewHandler(store types.UserStore) *Handler {
	return &Handler{store: store}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/login", h.handleLogin).Methods("POST")
	router.HandleFunc("/register", h.handleRegister).Methods("POST")
}

func (h *Handler) handleLogin(w http.ResponseWriter, r *http.Request) {
var payload types.LoginUserPayload
	if err := utils.ParseJSON(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	if err := utils.Validate.Struct(payload); err != nil {
		validationErrors := err.(validator.ValidationErrors)

		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid payload %v", validationErrors))
		return
	}

	fmt.Println("Searching for user with email: ", payload.Email)

	u, err := h.store.GetUserByEmail(payload.Email)
	fmt.Println("User found: ", u)
	fmt.Println("Error while getting user by email: ", err)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf(("not found, invalid email or password")))
		return
	}
	
	if !auth.ComparePassword(u.Password, []byte(payload.Password)) {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid email or password"))
		return
	}

	secret := []byte(config.Envs.JWTSecret)

	token, err := auth.CreateJWT(secret, u.ID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{"token": token})
}

func (h *Handler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var payload types.RegisterUserPayload
	if err := utils.ParseJSON(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	if err := utils.Validate.Struct(payload); err != nil {
		validationErrors := err.(validator.ValidationErrors)

		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid payload %v", validationErrors))
		return
	}

	fmt.Println("Registering user:", payload)

	_, err := h.store.GetUserByEmail(payload.Email)
	if err == nil {
		fmt.Println("User with email already exists:", err)
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	fmt.Println("User with email not found ", payload.Email)
	hashedPassword, err := auth.HashPassword(payload.Password)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	fmt.Println("Creating new user with email:", payload.Email)
	err = h.store.CreateUser(&types.User{
		FirstName: payload.FirstName,
		LastName:  payload.LastName,
		Email:     payload.Email,
		Password:  hashedPassword,
	})
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	fmt.Println("User created successfully:", payload.Email)
	utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "User created successfully"})
}

