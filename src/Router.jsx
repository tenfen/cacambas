import { Route, Routes } from "react-router-dom"
import { DefaultLayout } from "./layout/DefaultLayout"

import Device from "./pages/device/Device"
import BucketList from "./pages/bucket/BucketList"
import DeviceList from "./pages/device/DeviceList"
import DamageList from "./pages/damage/DamageList"
import AssistanceList from "./pages/assistances/AssistanceList"
import Assistance from "./pages/assistances/Assistance"

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route path="/" element={<DeviceList />} />

        <Route path="/buckets" element={<BucketList />} />
        <Route path="/damages" element={<DamageList />} />
        <Route path="/devices" element={<DeviceList />} />

        <Route path="/device/new" element={<Device />} />

        <Route path="/device/update/:deviceId" element={<Device />} />
        <Route path="/assistances" element={<AssistanceList />} />
        <Route path="/assistance/new" element={<Assistance />} />
        <Route path="/assistance/update/:assistanceId" element={<Assistance />} />

      </Route>
    </Routes>
  )
}
