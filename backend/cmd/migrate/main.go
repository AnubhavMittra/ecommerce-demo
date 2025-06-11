package main

import (
	"log"
	"os"

	"backend/config"
	"backend/db"
	mysqlConfig "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"

	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	db, err := db.NewMySQLStorage(mysqlConfig.Config{
		User:                 config.Envs.DBUser,
		Passwd:               config.Envs.DBPassword,
		Addr:                 config.Envs.DBAddress,
		DBName:               config.Envs.DBName,
		Net:                  "tcp",
		AllowNativePasswords: true,
		ParseTime:            true,
	})
	if err != nil {
		log.Fatal(err)
	}

	driver, err := mysql.WithInstance(db, &mysql.Config{})
	if err != nil {
		log.Fatalf("Failed to create MySQL driver instance: %v", err)
	}
	m, err := migrate.NewWithDatabaseInstance(
			"file://cmd/migrate/migrations",
			"mysql", 
			driver,
	)

	if err != nil {
		log.Fatalf("Failed to create migration instance: %v", err)
	}
	

	cmd := os.Args[(len(os.Args) - 1)]
	switch cmd {
	case "up":
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Failed to apply migrations: %v", err)
		} else {
			log.Println("Migrations applied successfully")
		}
	case "down":		
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Failed to revert migrations: %v", err)
		} else {
			log.Println("Migrations reverted successfully")
		}
	default:
		log.Fatalf("Unknown command: %s. Use 'up' or 'down'", cmd)																			
	}
}