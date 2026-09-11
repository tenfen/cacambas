import { MemoryController } from 'controllers/MemoryController'
import { useQuery } from 'react-query'

 // staleTime:5000, //time without fetching
      // refetchOnMount:true, //won't fetch if component is mounted
      // refetchOnWindowFocus:true, //will refetch when user return to page
      // refetchInterval:false, //Pooling - will refetch in a certain interval e.g. 3000 ms
      // refetchIntervalInBackground:false,// Pooling - will refetch even when windows are not on focus 
      // enabled:false, // will fetch data when every time that mount component, set false if you don't want this behavior
export const useMemoryData = () => {
    return useQuery(
        ["memory-options"], 
        () => MemoryController.getAll(),
        {
            staleTime:30000,
            refetchOnMount: false, 
            refetchOnWindowFocus: false,
        }
    )
}