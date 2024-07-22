package db

import (
	"os"
	"strings"
)

type IDB interface{
	Save(key string, data map[string]interface{}) (bool, error)
	Get(key string)(map[string]interface{}, error)
}

func GetDefaultDBconnection() IDB{

	redisHost := os.Getenv("REDIS_HOST")
	redisPassword := os.Getenv("REDIS_PASSWORD")
	redisPort := os.Getenv("REDIS_PORT")

	rc := &redisConfig{
		host: strings.Join([]string{redisHost, redisPort}, ":"),
		password: redisPassword,
		db: 0,
	}

	return rc.GetRedis()
}