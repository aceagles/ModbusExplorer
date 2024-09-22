package main

import (
	"log"

	"github.com/tbrandon/mbserver"
)

func main() {
	// Create a new Modbus server
	server := mbserver.NewServer()

	// set the first 20 registers with their square values
	for i := 0; i < 20; i++ {
		server.HoldingRegisters[i] = uint16(i * i)
	}
	server.HoldingRegisters[6] = 64340

	// Start the server
	go func() {
		err := server.ListenTCP("localhost:502")
		if err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Keep the server running
	select {}
}
