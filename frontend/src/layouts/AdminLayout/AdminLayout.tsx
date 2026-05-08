import {useAuth} from "../../hooks/useAuth.ts";
import {Fragment, useRef} from "react";
import {adminHeaderLinks} from "../../components/Header/navLinks.ts";
import {HeaderLink} from "../../components/Header/HeaderLink/HeaderLink.tsx";
import style from "./AdminLayout.module.scss";
import {Header} from "../../components/Header/Header.tsx";
import {Outlet} from "react-router-dom";
import {useExport, useImport} from "../../hooks/useImportExport.ts";
import {useQueryClient} from "@tanstack/react-query";

function AdminLayoutHeaderLinks() {
    const {logout} = useAuth();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const importMutation = useImport();
    const exportMutation = useExport();
    const queryClient = useQueryClient();

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleExportClick = () => {
        exportMutation.mutate();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert('Файл должен иметь расширение JSON');
            fileInputRef.current!.value = '';
            return;
        }

        try {
            await importMutation.mutateAsync(file);
            alert('Импорт успешно выполнен!');
            queryClient.invalidateQueries();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Ошибка при импорте';
            alert(errorMsg);
        } finally {
            fileInputRef.current!.value = '';
        }
    };

    return (
        <Fragment>
            {adminHeaderLinks.map((link) => (
                <HeaderLink text={link.text} path={link.path} />
            ))}

            <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <HeaderLink text={"Экспорт"} path={"/"} onClick={handleExportClick}/>
            <HeaderLink text={"Импорт"} path={"/"} onClick={handleImportClick}/>
            <HeaderLink text={"Выйти"} path={"/login"} onClick={logout}/>
        </Fragment>
    );
}

export function AdminLayout() {
    return (
        <div className={style.page}>
            <Header headerTitle={"Kitchify | ИС Администратор"}>
                <AdminLayoutHeaderLinks />
            </Header>
            <div className={style.layoutBody}>
                <Outlet />
            </div>
        </div>
    );
}