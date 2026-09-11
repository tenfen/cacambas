import { StorageController } from 'controllers/StorageContoller'
import { useQuery } from 'react-query'

export const useStorageData = () => {
    return useQuery(
        ["storage-options"],
        () => StorageController.getAll(),
        {
            staleTime:30000,
            refetchOnMount: false, 
            refetchOnWindowFocus: false,
        }
    )
}