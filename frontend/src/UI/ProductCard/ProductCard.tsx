import type {ReactElement} from "react";
import defaultImage from "../../assets/image_sample.png";
import style from "./ProductCard.module.scss"

export interface ProductCardProps {
    title: string;
    description: string;
    onClick: () => void;
}

export function ProductCard({title, description, onClick}: ProductCardProps): ReactElement {
    return (
        <div className={style.cardContainer}>
            <img alt={title} src={defaultImage} className={style.cardImage} />

            <div className={style.cardContent}>
                <div className={style.cardTextWrapper}>
                    <div className={style.cardTitle}>{title}</div>
                    <div className={style.cardDescription}>{description}</div>
                </div>
                <div className={style.cardButton} onClick={onClick}>
                    Создать заказ →
                </div>
            </div>
        </div>
    );
}