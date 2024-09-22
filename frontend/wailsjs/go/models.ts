export namespace main {
	
	export class modbusData {
	    Address: number;
	    Value: number;
	
	    static createFrom(source: any = {}) {
	        return new modbusData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Address = source["Address"];
	        this.Value = source["Value"];
	    }
	}

}

