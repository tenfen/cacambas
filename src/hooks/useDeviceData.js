import { useQuery, useMutation } from 'react-query'
import { DeviceController } from 'controllers/DeviceController'

export const useDeviceData = (id) => {
    return useQuery(
        ["device", id], 
        () => DeviceController.getDevice(id),
    )
}

export const useUpdateDeviceData = () => {
    return useMutation(DeviceController.update)
}

export const useCreateDeviceData = () => {
    return useMutation(DeviceController.create)
}