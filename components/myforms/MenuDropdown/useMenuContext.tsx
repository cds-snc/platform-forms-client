import React, { createContext, useState, useContext, useRef } from "react";
import { Menu } from "./Menu";

interface MenuContextType {
    registerMenu: (menu: HTMLUListElement) => void;
    closeAllMenus: () => void;
}

const defaults: MenuContextType = {
    closeAllMenus: () => void 0,
    registerMenu: () => void 0,
};

const MenuContext = createContext<MenuContextType>(defaults);

export function MenuProvider({ children }: { children: React.ReactNode }) {

    const itemsRef = useRef<[HTMLUListElement] | []>([]);

    const [menus, setMenus] = useState<Menu[]>([]);

    const closeAllMenus = () => {

    };

    const registerMenu = (el: HTMLUListElement) => {
        if (el && itemsRef.current) {
            itemsRef.current[0] = el;
        }
    };

    return (
        <MenuContext.Provider value={{ registerMenu, closeAllMenus }}>
            {children}
        </MenuContext.Provider>
    )
}

export const useMenuContext = () => useContext(MenuContext);
