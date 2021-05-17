import React, {useEffect, useState} from "react";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";

function ChatTagsList(props) {

    const [isLoading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        listTags();
    }, []);

    const listTags = () => {
        axios.get( `${BASE_URL}tags/`, getConfig())
            .then((response) => {
                console.log("Tags: ", response.data);

                setTags(response.data.results);

                setLoading(false);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    return (
        <div>
            {tags &&
            <div>
                {tags.map((tag) =>
                <div>
                    {tag.name}
                </div>
                )}
            </div>
            }
        </div>
    )
}

export default ChatTagsList;