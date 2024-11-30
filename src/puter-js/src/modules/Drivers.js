class FetchDriverCallBackend {
    constructor ({ context }) {
        this.context = context;
        this.response_handlers = this.constructor.response_handlers;
    }
    
    static response_handlers = {
        'application/x-ndjson': async resp => {
            const Stream = async function* Stream (readableStream) {
                const reader = readableStream.getReader();
                let value, done;
                while ( ! done ) {
                    ({ value, done } = await reader.read());
                    if ( done ) break;
                    const parts = (new TextDecoder().decode(value).split('\n'));
                    for ( const part of parts ) {
                        if ( part.trim() === '' ) continue;
                        yield JSON.parse(part);
                    }
                }
            }
            
            return Stream(resp.body);
        },
        'application/json': async resp => {
            return await resp.json();
        },
        'application/octet-stream': async resp => {
            return await resp.blob();
        },
    }
    
    async call ({ driver, method_name, parameters }) {
        const resp = await fetch(`${this.context.APIOrigin}/drivers/call`, {
            headers: {
                Authorization: `Bearer ${this.context.authToken}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                'interface': driver.iface_name,
                ...(driver.service_name
                    ? { service: driver.service_name }
                    : {}),
                method: method_name,
                args: parameters,
            }),
        });
        
        const content_type = resp.headers.get('content-type')
            .split(';')[0].trim(); // TODO: parser for Content-Type
        const handler = this.response_handlers[content_type];
        if ( ! handler ) {
            const msg = `unrecognized content type: ${content_type}`;
            console.error(msg);
            console.error('creating blob so dev tools shows response...');
            await resp.blob();
            throw new Error(msg);
        }
        
        return await handler(resp);
    }
}

class Driver {
    constructor ({
        iface,
        iface_name,
        service_name,
        call_backend,
    }) {
        this.iface = iface;
        this.iface_name = iface_name;
        this.service_name = service_name;
        this.call_backend = call_backend;
    }
    async call (method_name, parameters) {
        return await this.call_backend.call({
            driver: this,
            method_name,
            parameters,
        });
    }
}

class Drivers {
    /**
     * Creates a new instance with the given authentication token, API origin, and app ID,
     *
     * @class
     * @param {string} authToken - Token used to authenticate the user.
     * @param {string} APIOrigin - Origin of the API server. Used to build the API endpoint URLs.
     * @param {string} appID - ID of the app to use.
     */
    constructor (authToken, APIOrigin, appID) {
        this.authToken = authToken;
        this.APIOrigin = APIOrigin;
        this.appID = appID;
        
        // Driver-specific
        this.drivers_ = {};

        this.context = {};
        Object.defineProperty(this.context, 'authToken', {
            get: () => this.authToken,
        });
        Object.defineProperty(this.context, 'APIOrigin', {
            get: () => this.APIOrigin,
        });
    }

    /**
     * Sets a new authentication token and resets the socket connection with the updated token, if applicable.
     *
     * @param {string} authToken - The new authentication token.
     * @memberof [AI]
     * @returns {void}
     */
    setAuthToken (authToken) {
        this.authToken = authToken;
    }

    /**
     * Sets the API origin.
     * 
     * @param {string} APIOrigin - The new API origin.
     * @memberof [AI]
     * @returns {void}
     */
    setAPIOrigin (APIOrigin) {
        this.APIOrigin = APIOrigin;
    }
    
    async list () {
        const resp = await fetch(`${this.APIOrigin}/lsmod`, {
            headers: {
                Authorization: 'Bearer ' + this.authToken,
            },
            method: 'POST'
        });
        const list = await resp.json();
        return list.interfaces;
    }
    
    async get (iface_name, service_name) {
        const key = `${iface_name}:${service_name}`;
        if ( this.drivers_[key] ) return this.drivers_[key];
        
        const interfaces = await this.list();
        if ( ! interfaces[iface_name] ) {
            throw new Error(`Interface ${iface_name} not found`);
        }
        
        return this.drivers_[key] = new Driver ({
            call_backend: new FetchDriverCallBackend({
                context: this.context,
            }),
            iface: interfaces[iface_name],
            iface_name,
            service_name,
        });
    }
    
    async call (iface_name, service_name, method_name, parameters) {
        const driver = await this.get(iface_name, service_name);
        return await driver.call(method_name, parameters);
    }
    
}

export default Drivers;
