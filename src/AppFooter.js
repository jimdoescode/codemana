import React, { Component } from 'react';

import './AppFooter.scss';

class AppFooter extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    render() {
        return (
            <footer>
                <p className="container">&copy; CodeMana.com</p>
            </footer>
        );
    }
}

export default AppFooter;