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
const pdjs = require('@pagerduty/pdjs');
const BaseService = require('../BaseService');
const util = require('util');
const { Context } = require('../../util/context');

class PagerService extends BaseService {
    async _construct () {
        this.config = this.global_config.pager;
        this.alertHandlers_ = [];

    }
    async _init () {
        const services = this.services;

        this.alertHandlers_ = [];

        if ( ! this.config ) {
            return;
        }

        this.onInit();

        this._register_commands(services.get('commands'));
    }

    onInit () {
        if ( this.config.pagerduty && this.config.pagerduty.enabled ) {
            this.alertHandlers_.push(async alert => {
                const event = pdjs.event;

                const fields_clean = {};
                for ( const [key, value] of Object.entries(alert?.fields ?? {}) ) {
                    fields_clean[key] = util.inspect(value);
                }

                const custom_details = {
                    ...(alert.custom || {}),
                    server_id: this.global_config.server_id,
                };

                const ctx = Context.get(undefined, { allow_fallback: true });

                // Add request payload if any exists
                const req = ctx.get('req');
                if ( req ) {
                    if ( req.body ) {
                        // Remove fields which may contain sensitive information
                        delete req.body.password;
                        delete req.body.email;

                        // Add the request body to the custom details
                        custom_details.request_body = req.body;
                    }
                }

                this.log.info('it is sending to PD');
                await event({
                    data: {
                        routing_key: this.config.pagerduty.routing_key,
                        event_action: 'trigger',
                        dedup_key: alert.id,
                        payload: {
                            summary: alert.message,
                            source: alert.source,
                            severity: alert.severity,
                            custom_details,
                        },
                    },
                });
            });
        }
    }

    async alert (alert) {
        for ( const handler of this.alertHandlers_ ) {
            try {
                await handler(alert);
            } catch (e) {
                this.log.error(`failed to send pager alert: ${e?.message}`);
            }
        }
    }

    _register_commands (commands) {
        commands.registerCommands('pager', [
            {
                id: 'test-alert',
                description: 'create a test alert',
                handler: async (args, log) => {
                    const [severity] = args;
                    await this.alert({
                        id: 'test-alert',
                        message: 'test alert',
                        source: 'test',
                        severity,
                    });
                }
            }
        ])
    }

}

module.exports = {
    PagerService,
};
