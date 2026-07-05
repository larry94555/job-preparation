package workerpool

// ProcessAll squares each job concurrently using exactly `workers` goroutines,
// preserving the input order in the returned slice.
//
// TODO: implement using a bounded pool of goroutines coordinated with channels
// and a sync.WaitGroup. Do NOT spawn one goroutine per job, and do NOT busy-wait.
func ProcessAll(jobs []int, workers int) []int {
	panic("not implemented")
}
