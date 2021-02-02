import React from "react";
import TemplateMessages from "./TemplateMessages";

function ChatFooterExpired() {
    return (
        <div className="chat__footer expired">
            <p className="chat__footer__expiredWarning">This chat has expired. You need to answer with template messages.</p>
        </div>
    )
}

export default ChatFooterExpired