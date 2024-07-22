package data

import (
	"errors"

	"github.com/BrunoTeleginski/bpf-manager/backend/db"
)


func GetPodNetworkData(podName string, minutesAgo int) (map[string]interface{}, error){

	//get the DB connection
	dbConn := db.GetDefaultDBconnection()

	data, err := dbConn.GetAll(podName, minutesAgo)
	if err != nil{
		return nil, errors.New("DB get: error on getting data: "+err.Error())
	}

	return data, nil
}