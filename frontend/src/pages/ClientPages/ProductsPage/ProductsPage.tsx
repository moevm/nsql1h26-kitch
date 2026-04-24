import {Fragment, type ReactElement} from "react";
import {useNavigate} from "react-router-dom";
import {ProductCard} from "../../../UI/CommonCards/ProductCard/ProductCard.tsx";
import {kitchenTypesMap} from "../../../utils/kitchenTypesMap.ts";
import {useDesignTypes} from "../../../hooks/useDesigns.ts";

export function ProductsPage(): ReactElement {
    const { data: designTypes, isLoading, error } = useDesignTypes();
    const navigate = useNavigate();

    const handleCreateOrder = () => {
         navigate("/orders/create");
    };

    if (isLoading) {
        return (<div>Загружаем дизайны...</div>);
    }

    if (error) {
        return (<div>Ошибка загрузки: {error.message}</div>);
    }

    return (
        <Fragment>
            {designTypes?.map((designType) => (
                <ProductCard
                    key={designType.type}
                    title={designType.type}
                    description={kitchenTypesMap[designType.type]}
                    onClick={() => handleCreateOrder()}
                />
            ))}
        </Fragment>
    );
}