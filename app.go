package main

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/simonvetter/modbus"
	"github.com/wailsapp/wails/v2/pkg/runtime"
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
		a.SetConnected(false)
		return err
	}

	err = client.SetUnitId(uint8(unitID))
	if err != nil {
		a.SetConnected(false)
		return err
	}
	a.SetConnected(true)
	fmt.Println("Connected")
	return nil
}

func (a *App) SetUnitId(id uint8) error {
	return a.client.SetUnitId(id)
}

func (a *App) Disconnect() {
	if a.connected {
		a.client.Close()
		a.SetConnected(false)
	}
}

type modbusData struct {
	Address uint16
	Value   uint16
}

func (a *App) SetConnected(isConnected bool) {
	a.connected = isConnected
	runtime.EventsEmit(a.ctx, "setConnected", isConnected)
}

func (a *App) Read(inputType string, address uint16, quantity uint16) ([]modbusData, error) {
	if a.client == nil {
		return nil, errors.New("Client is not configured.")
	}
	if !a.connected {
		// err := a.client.Open()
		// if err != nil {
		// 	return nil, err
		// }
		// a.SetConnected(true)
		return nil, errors.New("Disconnected from server.")
	}
	var regType modbus.RegType
	var results []uint16
	var err error
	switch inputType {
	case "Discrete Input", "Coil":
		var boolResult []bool
		if inputType == "Discrete Input" {
			boolResult, err = a.client.ReadDiscreteInputs(address, quantity)
		} else {
			boolResult, err = a.client.ReadCoils(address, quantity)
		}
		for _, v := range boolResult {
			var intVal uint16
			if v {
				intVal = 1
			}
			results = append(results, intVal)
		}
	case "Input Register", "Holding Register":
		if inputType == "Input Register" {
			regType = modbus.INPUT_REGISTER
		} else {
			regType = modbus.HOLDING_REGISTER
		}
		results, err = a.client.ReadRegisters(address, quantity, regType)
	default:
		return nil, fmt.Errorf("Invalid input type: %s", inputType)
	}
	if err != nil {
		a.SetConnected(false)
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

func (a *App) Write(inputType string, address uint16, value []uint16) error {
	if !a.connected {
		return fmt.Errorf("Not connected.")
	}
	if inputType == "Holding Register" {
		return a.client.WriteRegisters(address, value)
	} else if inputType == "Coil" {
		return a.client.WriteCoil(address, value[0] > 0)
	}
	return errors.New("Invalid register type")
}
