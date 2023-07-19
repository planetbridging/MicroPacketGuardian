package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/joho/godotenv"
	"github.com/oschwald/geoip2-golang"
)

func testGeo() {
	db, err := geoip2.Open("GeoLite2-City.mmdb")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	// If you are using strings that may be invalid, check that ip is not nil
	ip := net.ParseIP("81.2.69.142")
	record, err := db.City(ip)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Portuguese (BR) city name: %v\n", record.City.Names["pt-BR"])
	if len(record.Subdivisions) > 0 {
		fmt.Printf("English subdivision name: %v\n", record.Subdivisions[0].Names["en"])
	}
	fmt.Printf("Russian country name: %v\n", record.Country.Names["ru"])
	fmt.Printf("ISO country code: %v\n", record.Country.IsoCode)
	fmt.Printf("Time zone: %v\n", record.Location.TimeZone)
	fmt.Printf("Coordinates: %v, %v\n", record.Location.Latitude, record.Location.Longitude)
	// Output:
	// Portuguese (BR) city name: Londres
	// English subdivision name: England
	// Russian country name: Великобритания
	// ISO country code: GB
	// Time zone: Europe/London
	// Coordinates: 51.5142, -0.0931
}

func main() {
	fmt.Println("welcome to go micro packet guardian")
	//testGeo()

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	startProxy(os.Getenv("externalService"), os.Getenv("PORThttps"), os.Getenv("cert"), os.Getenv("privkey"))

	/*
		app := fiber.New()

		// Create a new endpoint
		app.Get("/", func(c *fiber.Ctx) error {
			return c.SendString("Hello World!")
		})

		// Start server on port 3000
		app.Listen(":3000")*/
}
