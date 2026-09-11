import React from 'react'
import Image from '../../assets/images/logo.png'
// Styles
import './Header.scss'
export default function Header() {

    return (
        <header className='page-header'>
            <img src={Image} alt="logomarca"  />
        </header>
    )
}