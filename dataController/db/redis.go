package db

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

type redisConfig struct{
	host string
	password string
	db int
}

type redisConnetion struct{
	*redis.Client
}

var ctx = context.Background()

func (r *redisConfig)GetRedis() IDB{
	return &redisConnetion{redis.NewClient(&redis.Options{
        Addr:     r.host,
        Password: r.password,
        DB:       r.db,
    })}
}


func (r *redisConnetion) Save(key string, data map[string]interface{}) (bool, error){
	dataByte, marshalErr := json.Marshal(data)
	if marshalErr != nil{
		return false, errors.New(marshalErr.Error())
	}

	err := r.Client.Set(ctx,  key, dataByte, time.Duration(time.Hour * 2)).Err()
	
    if err != nil {
        return false, errors.New(err.Error())
    }

	return true, nil
}

func (r *redisConnetion) Get(key string)(map[string]interface{}, error){
	
	val2, err := r.Client.Get(ctx, key).Result()
    if err == redis.Nil {
        return map[string]interface{}{}, nil
    } else if err != nil {
        return nil, errors.New("Redis: error on get the values from key!")
	}

	return map[string]interface{}{
		"data": val2,
	}, nil
}