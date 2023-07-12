package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func startProxy(proxyTo string) {
	target, _ := url.Parse(proxyTo)
	proxy := httputil.NewSingleHostReverseProxy(target)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Add your custom logic here, for example:
		// Manipulate headers:
		r.Header.Add("X-Forwarded-Host", r.Header.Get("Host"))
		// Log the request:
		log.Println(r.URL)

		// Then call the reverse proxy:
		proxy.ServeHTTP(w, r)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
