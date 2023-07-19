package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func startProxy(proxyTo string, PORThttps string, certificatePath string, privkeyPath string) {
	target, _ := url.Parse(proxyTo)
	proxy := httputil.NewSingleHostReverseProxy(target)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Check if the request is over HTTPS
		/*if r.TLS == nil {
			// Redirect to HTTPS version of the URL
			redirectURL := "https://" + r.Host + r.RequestURI
			http.Redirect(w, r, redirectURL, http.StatusMovedPermanently)
			return
		}*/

		// Add your custom logic here, for example:
		// Manipulate headers:
		r.Header.Add("X-Forwarded-Host", r.Header.Get("Host"))
		// Log the request:
		log.Println(r.URL)

		// Then call the reverse proxy:
		proxy.ServeHTTP(w, r)
	})

	log.Fatal(http.ListenAndServeTLS(":"+PORThttps, certificatePath, privkeyPath, nil))
	//log.Fatal(http.ListenAndServe(":8080", nil))
}
