package db

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
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


func (r *redisConnetion) GetAll(key string, minutesAgo int)(map[string]interface{}, error){
	
	var timeMinutesAgo int64

	//if minutesAgo is equal zero, it gets all the logs from the current time
	if minutesAgo == 0{
		timeMinutesAgo = time.Now().Add(time.Duration(-10) * time.Second).Unix()
	}else{
		//get the timestamp from the X minutes ago 
		timeMinutesAgo = time.Now().Add(time.Duration(-minutesAgo) * time.Minute).Unix()
	}

	dataReturn := []string{}

	//loop all keys based on the pod name chosen
	iter := r.Client.Scan(ctx, 0, key+"*", 0).Iterator()
	for iter.Next(ctx) {
		
		//create a regex to extract the timestamp from the redis key
		re := regexp.MustCompile(`\:(.*)`)
		match := re.FindStringSubmatch(iter.Val())

		if len(match) > 1{
			//transform string to int64
			dataTime, err := strconv.ParseInt(match[1], 10, 64)
			if err != nil{
				continue
			}

			//validate if the time is in the minutes ago chosen
			if dataTime >= timeMinutesAgo{
				
				d, err := r.Client.Get(ctx, iter.Val()).Result()
				if err != redis.Nil{
					fmt.Println(err)
				}else if d == ""{
					fmt.Println("Redis get: Empty!")
				}

				dataReturn = append(dataReturn, d)
			}
		}
	}

	if err := iter.Err(); err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"data": dataReturn,
	}, nil
}