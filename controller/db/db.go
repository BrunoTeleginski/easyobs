package db

import (
	"os"
	"strings"
)

type IDB interface{
	GetAll(key string, minutesAgo int)(map[string]interface{}, error)
}

var dbIntance *redisConfig

func GetDefaultDBconnection() IDB{

	if dbIntance != nil{
		return dbIntance.GetRedis()
	}

	redisHost := os.Getenv("REDIS_HOST")
	redisPassword := os.Getenv("REDIS_PASSWORD")
	redisPort := os.Getenv("REDIS_PORT")

	dbIntance := &redisConfig{
		host: strings.Join([]string{redisHost, redisPort}, ":"),
		password: redisPassword,
		db: 0,
	}

	return dbIntance.GetRedis()
}