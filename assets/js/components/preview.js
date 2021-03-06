import React from 'react';
import PDF from 'react-pdf-component';

export default class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.state = { pages: 1, page: 0 };
    }

    render() {
        return <div className="preview">
            { this.props.update && <p>
                <button className="btn btn-info" onClick={this.props.update}>Update</button>
            </p> }
            <PDF data={this.props.data} />
        </div>
    }
}

