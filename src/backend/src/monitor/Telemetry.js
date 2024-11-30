/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PeriodicExportingMetricReader, ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics');

const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { ConsoleSpanExporter, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const config = require('../config');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

class TelemetryService {
    static instance_ = null;
    static getInstance () {
        if ( this.instance_ ) return this.instance_;
        return this.instance_ = new TelemetryService();
    }

    constructor () {
        const resource = Resource.default().merge(
            new Resource({
                [SemanticResourceAttributes.SERVICE_NAME]: "puter-backend",
                [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0"
            }),
        );

        const provider = new NodeTracerProvider({ resource })
        const exporter = this.getConfiguredExporter_();
        this.exporter = exporter;

        const processor = new BatchSpanProcessor(exporter);
        provider.addSpanProcessor(processor);

        provider.register();

        const sdk = new NodeSDK({
            traceExporter: new ConsoleSpanExporter(),
            metricReader: new PeriodicExportingMetricReader({
                exporter: new ConsoleMetricExporter()
            }),
            instrumentations: [getNodeAutoInstrumentations()]
        });

        this.sdk = sdk;
    }

    getConfiguredExporter_() {
        if ( config.jaeger ) {
            return new OTLPTraceExporter(config.jaeger);
        }
        const exporter = new ConsoleSpanExporter();
    }

    start () {
        // this.sdk.start();
    }
}

module.exports = {
    TelemetryService
}