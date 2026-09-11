import React, { useEffect, useState, useContext } from "react"

// Componentes
import Search from "components/search/Search"
import Button from "../../components/button/Button"
import BucketItem from "../../components/BucketItem/BucketItem"

// Controllers
import BucketController from "controllers/BucketController"

// Contexts
import FeatureContext from "../../contexts/FeatureContext"
import LoadingContext from "../../contexts/LoadingContext"

import "./BucketList.scss"
import BucketModal from "../../modals/Bucket/BucketModal"
import { setLocalItem } from "../../helpers/StorageTools"

export default function BrandList () {
  const { buckets, setBuckets } = React.useContext(FeatureContext)
  const { setLoading } = React.useContext(LoadingContext)

  const [searchValue, setSearchValue] = React.useState("")
  const [bucketModal, setBucketModal] = React.useState({ status: false, content: null })

  useEffect(() => {
    setLoading(true)
    BucketController.getAllBuckets() 
      .then((responseBuckets) => {
        console.log('buckets---------', responseBuckets)
        if (responseBuckets.status === 200) {
          setBuckets(responseBuckets.content)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  
  
  const onChangeSearch = (event) => {
    const value = event.target.value
    if (value.length > 2) {
      BucketController.getAllBuckets({ filterValue: value }).then((responseBucket) => {
        console.log('buckets---------', responseBucket)
        if (responseBucket.status === 200) {
          setBuckets(responseBucket.content)
        }
      })
    }

    setSearchValue(value)
  }

  const onRefreshBuckets = () => {
    BucketController.getAllBuckets().then((responseBucket) => {
      if (responseBucket.status === 200) {
        setBuckets(responseBucket.content)
        setLocalItem("buckets", responseBucket.content, true)
      } else {
        console.error("Erro ao consultar dados de caçambas")
      }
    })
  }

  return (
    <div className="bucket-list">
      <div className="bucket-list--header">
        <h2>Caçambas</h2>
        <Button onClick={() => setBucketModal({ status: true, title: "Cadastrar Caçamba", content: null })}>Adicionar Caçamba</Button>
      </div>
      <div className="bucket-list--body">
        <div className="bucket-list--body--top">
          <Search value={searchValue} onChange={onChangeSearch} />
        </div>
        <div className="bucket-list--body--bottom">
          {buckets.map((bucket, key) => (
            <BucketItem key={key} bucket={bucket} onClick={() => setBucketModal({ status: true, title: "Atualizar Caçamba", content: bucket })} />
          ))}
        </div>
      </div>

      <BucketModal
        status={bucketModal.status}
        title={bucketModal.title}
        content={bucketModal.content}
        onRefresh={() => {
          onRefreshBuckets()
          setBucketModal({ status: false, content: null })
        }}
        onClose={() => setBucketModal({ status: false, content: null })}
      />
    </div>
  )
}
