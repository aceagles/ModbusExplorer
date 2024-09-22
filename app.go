package main

import (
	"context"
	"fmt"
	"time"

	"github.com/simonvetter/modbus"
)

// App struct
type App struct {
	ctx       context.Context
	client    *modbus.ModbusClient
	connected bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Connect(ip string, port int, unitID int) error {
	fmt.Println("Connecting to", ip, port, unitID)
	client, err := modbus.NewClient(&modbus.ClientConfiguration{
		URL:     fmt.Sprintf("tcp://%s:%d", ip, port),
		Timeout: 10 * time.Second,
	})
	if err != nil {
		return err
	}
	a.client = client
	err = client.Open()
	if err != nil {
		a.connected = false
		return err
	}
	a.connected = true
	fmt.Println("Connected")
	return nil
}

func (a *App) Disconnect() {
	if a.connected {
		a.client.Close()
		a.connected = false
	}
}

type modbusData struct {
	Address uint16
	Value   uint16
}

func (a *App) Read(inputType string, address uint16, quantity uint16) ([]modbusData, error) {
	var regType modbus.RegType
	switch inputType {
	case "Input Register":
		regType = modbus.INPUT_REGISTER
	case "Holding Register":
		regType = modbus.HOLDING_REGISTER
	default:
		return nil, fmt.Errorf("Invalid input type: %s", inputType)
	}
	results, err := a.client.ReadRegisters(address, quantity, regType)
	fmt.Println(results)
	if err != nil {
		return nil, err
	}
	var returndata []modbusData
	for i, value := range results {
		returndata = append(returndata, modbusData{
			Address: address + uint16(i),
			Value:   value,
		})
	}

	return returndata, nil
}
