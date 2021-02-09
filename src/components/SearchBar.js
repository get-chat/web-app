import React from 'react';
import {SearchOutlined} from "@material-ui/icons";
import '../styles/SearchBar.css';

function SearchBar(props) {
    return (
        <div className="searchBar__search">
            <div className="searchBar__searchContainer">
                <SearchOutlined />
                <input placeholder="Search" type="text" />
            </div>
        </div>
    )
}

export default SearchBar;