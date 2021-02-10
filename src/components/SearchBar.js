import React from 'react';
import {SearchOutlined} from "@material-ui/icons";
import '../styles/SearchBar.css';

function SearchBar(props) {

    const handleChange = (event) => {
        props.onChange(event.target.value);
    }

    return (
        <div className="searchBar__search">
            <div className="searchBar__searchContainer">
                <SearchOutlined />
                <input placeholder="Search" type="text" onChange={handleChange} />
            </div>
        </div>
    )
}

export default SearchBar;