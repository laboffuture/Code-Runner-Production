LENS: Architecture-fit & resilience.

Two questions. (1) FIT: does the change sit coherently in the whole architecture with no contract
drift? An API response shape/field/type changed without updating every consumer is HIGH (e.g.
backend returns `roster`, frontend reads `students`). Watch for hidden coupling and leaky
boundaries. (2) RESILIENCE: can the system withstand any situation — load spikes, a runner dying or
restarting mid-job, a rogue or timed-out container, Mongo contention, malformed or hostile input,
partial failures? Missing resilience on a critical path (execution, grading, auth) is HIGH.
