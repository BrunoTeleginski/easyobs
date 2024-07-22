FROM golang:alpine3.19
WORKDIR /app

COPY . ./
RUN go mod download
RUN go build -o app

EXPOSE 9000

ENTRYPOINT ["./app"]