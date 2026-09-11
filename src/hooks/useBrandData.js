import { BrandController } from 'controllers/BucketController'
import { useQuery } from 'react-query'

export const useBrandData = () => {
    return useQuery(
        ["brand-options"], 
        () => BrandController.getAll(),
        {
            staleTime:30000,
            refetchOnMount: false, 
            refetchOnWindowFocus: false,
        }
    )
}