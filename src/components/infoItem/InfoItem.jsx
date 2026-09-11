import './InfoItem.scss'

export function InfoItem(props) {
    const { label, content } = props

    return (
        <ul className="info-item" >
            <span className="label">{label}: </span>
            {content}
        </ul>
    )
}