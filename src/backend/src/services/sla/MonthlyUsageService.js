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
const BaseService = require("../BaseService");
const { UserActorType, AppUnderUserActorType } = require("../auth/Actor");
const { DB_WRITE } = require("../database/consts");

class MonthlyUsageService extends BaseService {
    async _init () {
        this.db = this.services.get('database').get(DB_WRITE, 'usage');
    }

    async increment (actor, key, extra) {
        key = `${actor.uid}:${key}`;

        const year = new Date().getUTCFullYear();
        // months are zero-indexed by getUTCMonth, which could be confusing
        const month = new Date().getUTCMonth() + 1;

        const maybe_app_id = actor.type.app?.id;
        const stringified = JSON.stringify(extra);

        // UPSERT increment count
        await this.db.write(
            'INSERT INTO `service_usage_monthly` (`year`, `month`, `key`, `count`, `user_id`, `app_id`, `extra`) ' +
            'VALUES (?, ?, ?, 1, ?, ?, ?) ' +
            this.db.case({
                mysql: 'ON DUPLICATE KEY UPDATE `count` = `count` + 1, `extra` = ?',
                // sqlite: ' ',
                otherwise: 'ON CONFLICT(`year`, `month`, `key`) ' +
                    'DO UPDATE SET `count` = `count` + 1, `extra` = ?',
            }),
            [
                year, month, key, actor.type.user.id, maybe_app_id ?? null, stringified,
                stringified,
            ]
        );
    }

    async check (actor, specifiers) {
        if ( actor.type instanceof UserActorType ) {
            return await this._user_check(actor, specifiers);
        }

        if ( actor.type instanceof AppUnderUserActorType ) {
            return await this._app_under_user_check(actor, specifiers);
        }

    }

    async check_2 (actor, key) {
        key = `${actor.uid}:${key}`;
        if ( actor.type instanceof UserActorType ) {
            return await this._user_check_2(actor, key);
        }

        if ( actor.type instanceof AppUnderUserActorType ) {
            return await this._app_under_user_check_2(actor, key);
        }

    }

    async _user_check (actor, specifiers) {
        const year = new Date().getUTCFullYear();
        // months are zero-indexed by getUTCMonth, which could be confusing
        const month = new Date().getUTCMonth() + 1;

        const rows = await this.db.read(
            'SELECT SUM(`count`) AS sum FROM `service_usage_monthly` ' +
            'WHERE `year` = ? AND `month` = ? AND `user_id` = ? ' +
            'AND JSON_CONTAINS(`extra`, ?)',
            [
                year, month, actor.type.user.id,
                JSON.stringify(specifiers),
            ]
        );

        return rows[0]?.sum || 0;
    }

    async _user_check_2 (actor, key) {
        const year = new Date().getUTCFullYear();
        // months are zero-indexed by getUTCMonth, which could be confusing
        const month = new Date().getUTCMonth() + 1;

        console.log(
            'what check query?',
            'SELECT SUM(`count`) AS sum FROM `service_usage_monthly` ' +
            'WHERE `year` = ? AND `month` = ? AND `user_id` = ? ' +
            'AND `key` = ?',
            [
                year, month, actor.type.user.id,
                key,
            ]
        );
        const rows = await this.db.read(
            'SELECT SUM(`count`) AS sum FROM `service_usage_monthly` ' +
            'WHERE `year` = ? AND `month` = ? AND `user_id` = ? ' +
            'AND `key` = ?',
            [
                year, month, actor.type.user.id,
                key,
            ]
        );
        
        console.log('what rows?', rows);
        
        return rows[0]?.sum || 0;
    }

    async _app_under_user_check (actor, specifiers) {
        const year = new Date().getUTCFullYear();
        // months are zero-indexed by getUTCMonth, which could be confusing
        const month = new Date().getUTCMonth() + 1;

        const specifier_entries = Object.entries(specifiers);

        // SELECT count
        const rows = await this.db.read(
            'SELECT `count` FROM `service_usage_monthly` ' +
            'WHERE `year` = ? AND `month` = ? AND `user_id` = ? ' +
            'AND `app_id` = ? ' +
            'AND JSON_CONTAINS(`extra`, ?)',
            [
                year, month, actor.type.user.id,
                actor.type.app.id,
                specifiers,
            ]
        );

        return rows[0]?.count || 0;
    }

    async _app_under_user_check_2 (actor, key) {
        const year = new Date().getUTCFullYear();
        // months are zero-indexed by getUTCMonth, which could be confusing
        const month = new Date().getUTCMonth() + 1;

        // SELECT count
        const rows = await this.db.read(
            'SELECT `count` FROM `service_usage_monthly` ' +
            'WHERE `year` = ? AND `month` = ? AND `user_id` = ? ' +
            'AND `app_id` = ? ' +
            'AND `key` = ?',
            [
                year, month, actor.type.user.id,
                actor.type.app.id,
                key,
            ]
        );

        return rows[0]?.count || 0;
    }
}

module.exports = {
    MonthlyUsageService,
};
