package api

import (
	"database/sql"
	"log"
	"net/http"

	"backend/service/user"
	"backend/service/cart"
	"backend/service/product"
	cartstore "backend/service/cart"
	orderstore "backend/service/order"
	productstore "backend/service/product"
	userstore "backend/service/user"
	"github.com/gorilla/mux"
)

type APIServer struct {
	addr string
	db   *sql.DB
}

func NewAPIServer(addr string, db *sql.DB) *APIServer {
	return &APIServer{
		addr: addr,
		db:   db,
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *APIServer) Run() error {
	router := mux.NewRouter()
	router.Use(corsMiddleware) 


	router.Methods(http.MethodOptions).HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusNoContent)
	})

	subrouter := router.PathPrefix("/api/v1").Subrouter()
	userStore := userstore.NewStore(s.db)
	productStore := productstore.NewStore(s.db)
	cartStore := cartstore.NewCartStore(s.db)
	orderStore := orderstore.NewStore(s.db)

	userHandler := user.NewHandler(userStore)
	userHandler.RegisterRoutes(subrouter)

	productHandler := product.NewHandler(productStore, userStore)
	productHandler.RegisterRoutes(subrouter)

	cartHandler := cart.NewHandler(productStore, orderStore, userStore, cartStore)
	cartHandler.RegisterRoutes(subrouter)

	log.Println("Listening on ", s.addr)
	return http.ListenAndServe(s.addr, router)
}
