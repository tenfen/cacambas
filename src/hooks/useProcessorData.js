import { ProcessorController } from 'controllers/ProcessorController'
import { useQuery } from 'react-query'

export const useProcessorData = () => {
    return useQuery(
        ["processor-options"],
        () => ProcessorController.getAll(),
        {
            staleTime: 30000,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        }
    )
}