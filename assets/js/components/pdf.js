import React from 'react';
import PDFJS from 'pdfjs-dist'
import { findDOMNode } from 'react-dom';

export default class PDF extends React.Component {

    constructor(props) {
        super(props);
        this.state = { };
    }

     _loadPDFDocument(props) {
        if(props.data){
            return PDFJS.getDocument({data: props.data}).then(::this._onDocumentComplete);
        }
    }

    componentDidMount() {
        this._loadPDFDocument(this.props);
    }

    componentWillReceiveProps(newProps) {
        if ((newProps.data && newProps.data !== this.props.data)) {
          this._loadPDFDocument(newProps);
        }
        if (!!this.state.pdf && !!newProps.page && newProps.page !== this.props.page) {
          this.setState({page: null});
          this.state.pdf.getPage(newProps.page)
            .then(::this._onPageComplete);
        }
    }

    shouldComponentUpdate(newProps, newState) {
        if ((newProps.data && newProps.data !== this.props.data)){
            return true;
        }
        if ((newProps.page && newProps.page !== this.props.page)){
            return true;
        }
        if((newState.pdf && newState.pdf !== this.state.pdf) ||
            (newState.page && newState.page !== this.state.page)){
            return true;
        }
        return false;
    }

    componentWillUnmount() {
        clearTimeout(this._renderTimeout);
        this._unmounted = true;
    }

    render() {
        if (!!this.state.page){
            clearTimeout(this._renderTimeout)
            this._renderTimeout = setTimeout(() => {
                const canvas = findDOMNode(this.refs.pdfCanvas),
                    context = canvas.getContext('2d'),
                    scale = this.props.scale || 1,
                    viewport = this.state.page.getViewport(canvas.width / this.state.page.getViewport(1.0).width);

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                  };
                this.state.page.render(renderContext);
          });
          return <canvas ref="pdfCanvas" width={1500} heigth={2250}/>
        }
        return <div>Could not load preview.  Please complete all required fields.</div>
    }

    _onDocumentComplete(pdf) {
        if (!this._unmounted) {
            this.setState({ pdf: pdf });
            pdf
                .getPage(this.props.page)
                .then(::this._onPageComplete);
            this.props.onDocumentComplete(pdf.numPages);
        }
    }

    _onPageComplete(page) {
        if(!this._ummounted){
            this.setState({ page: page });
        }
    }
}