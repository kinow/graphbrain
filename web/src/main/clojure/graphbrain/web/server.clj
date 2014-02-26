(ns graphbrain.web.server
  (:use compojure.core
        ring.adapter.jetty
        (ring.middleware resource file-info cookies params)
        (graphbrain.web.handlers landing node nodeactions user
                                         raw search aichat relations
                                         allusers))
  (:require [compojure.handler :as handler]
            [compojure.route :as route]))

(defroutes app-routes
  (GET "/" request (handle-landing request))
  (GET "/node/*" request (handle-node request))
  (POST "/node/*" request (handle-nodeactions request))
  (GET "/raw/*" request (handle-raw request))
  (POST "/signup" request (handle-signup request))
  (POST "/checkusername" request (handle-check-username request))
  (POST "/checkemail" request (handle-check-email request))
  (POST "/login" request (handle-login request))
  (POST "/search" request (handle-search request))
  (POST "/ai" request (handle-aichat request))
  (POST "/rel" request (handle-relations request))
  (GET "/allusers" request (handle-allusers request))
  (route/not-found "<h1>Page not found</h1>"))

(def app
  (-> app-routes
    (wrap-resource "")
    wrap-file-info
    wrap-params
    wrap-cookies))

(run-jetty app {:port 4567})