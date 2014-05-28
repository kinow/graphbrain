(ns graphbrain.db.consensus
  (:require [graphbrain.db.id :as id]
            [graphbrain.db.gbdb :as gb]
            [graphbrain.db.maps :as maps]
            [graphbrain.db.queues :as queues]))

(defn eval-edge!
  [gbdb edge-id]
  (if (id/global-space? edge-id)
    (let [edge (maps/id->edge edge-id)
          neg-edge (maps/negate edge)
          pids (maps/participant-ids edge)
          alt-vertices (gb/global-alts (first pids))
          score (loop [altvs alt-vertices
                       score 0]
                  (if (empty? altvs) score
                      (let [altv (first altvs)
                            owner-id (id/owner altv)
                            local-edge (maps/global->local edge owner-id)
                            neg-local-edge (maps/global->local neg-edge owner-id)
                            s (if (gb/exists? gbdb local-edge) (inc score) score)
                            s (if (gb/exists? gbdb neg-local-edge) (dec s) s)]
                        (recur (rest altvs) s))))]
      (if (> score 0) (gb/putv! gbdb edge) (gb/remove! gbdb edge)))))

(defn start-consensus-processor!
  [gbdb]
  (compare-and-set! queues/consensus-active false true)
  (def consensus-processor (future
     (while @queues/consensus-active
       (eval-edge! (.take queues/consensus-queue))))))

(defn stop-consensus-processor!
  []
  (compare-and-set! queues/consensus-active true false))