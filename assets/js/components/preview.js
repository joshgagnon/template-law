import React from 'react';
import PDF from './pdf';

export default class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.state = { pages: 1, page: 0 };
    }

    pdfLoaded(pages) {
        this.setState({pages: pages})
    }

    prev(e) {
        e.preventDefault();
        this.setState({page: Math.abs((this.state.page - 1) % this.state.pages)})
    }

    next(e) {
        e.preventDefault();
        this.setState({page: Math.abs((this.state.page + 1) % this.state.pages)})
    }

    render() {
        return <div className="preview">
            <p>
            <button className="btn btn-info" onClick={this.props.update}>Update</button>
            </p>
            { this.state.pages > 1 && <p>
                <button className="btn btn-info" onClick={::this.prev}><span className="glyphicon glyphicon-arrow-left"/></button>
                <button className="btn btn-info" onClick={::this.next}><span className="glyphicon glyphicon-arrow-right"/></button>
                </p>
            }
            <PDF onDocumentComplete={::this.pdfLoaded} data={this.props.data} page={this.state.page+1} />
        </div>
    }
}

