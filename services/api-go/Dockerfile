FROM golang:1.26-alpine AS build
WORKDIR /src
COPY services/api-go/go.mod services/api-go/go.sum ./
RUN go mod download
COPY services/api-go ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/server

FROM alpine:3.22
RUN addgroup -S kineguide && adduser -S -G kineguide kineguide
COPY --from=build /out/api /api
EXPOSE 8080
USER kineguide:kineguide
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:8080/health >/dev/null || exit 1
ENTRYPOINT ["/api"]
