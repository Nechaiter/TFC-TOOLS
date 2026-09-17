// Greedy algorithm.
// Is it better to use -3, -6, or -9 hit values?
// TODO: prove this algorithm never goes into an infinite loop.
// From 0 to the sum_items target.
type StepData = { value: number };
type StepsAvailable = Record<string, StepData>;
type StepObject = StepData & { key: string };

export function GreedyAlgorithm(target_pos: number, steps_available: StepsAvailable): string[] {
    const startTime = performance.now();


    let initial_poss=0
    let step_object!: StepObject
    let maxIterations = 1000;
    let steps_to_target: string[] = []
    while (initial_poss!=target_pos && maxIterations-- >0){
        let closest_step_to_target=Infinity
        Object.entries(steps_available).forEach(([key,step_data])=>{
            let new_step_diff_from_current_pos=Math.abs(target_pos-(initial_poss+step_data.value))
            if (new_step_diff_from_current_pos<closest_step_to_target){
                closest_step_to_target=new_step_diff_from_current_pos
                step_object={key,...step_data}
            }
        })
        initial_poss=initial_poss+step_object.value
        steps_to_target.push(step_object.key)
    }

    const endTime = performance.now();
    const timeElapsed = (endTime - startTime).toFixed(2);
    console.log(`${timeElapsed} ms`)
    return steps_to_target
}

// TODO: prove that, given the default step values, the target is never beyond 8 steps deep.
export function short_path(target_pos: number, steps_available: StepsAvailable): string[] {
    const startTime = performance.now();
    let steps_value = new Set<number>()
    Object.entries(steps_available).forEach(([key, step]) => {
        steps_value.add(step.value)
    })
    function dfs(current_node: number, target_pos: number, depth: number, path: string[], visited: Set<number>): string[] | null {
        if (current_node===target_pos) return path
        // Goes beyond the defined depth
        if (depth <=0) return null
        for (const [key, step] of Object.entries(steps_available)){
            let next_node = current_node+step.value
            if ((steps_value.has(next_node) && current_node==0) || (!steps_value.has(next_node)&& current_node!=0)
            ){
                visited.add(next_node)
                path.push(key)
                let result = dfs(next_node,target_pos, depth-1,path,visited)
                if (result) return result
                path.pop()
                visited.delete(next_node)
            }
        }
        return null
    }
    
    let max_iterations_depth=50
    let min_iterations_depth=0
    while(max_iterations_depth-- >0){
        let result=dfs(0,target_pos,min_iterations_depth,[],new Set([0]))
        if (result){
            const endTime = performance.now();
            const timeElapsed = (endTime - startTime).toFixed(2);
            console.log(`${timeElapsed} ms`)

            return result
        } 
        min_iterations_depth++
    }
    return []
}