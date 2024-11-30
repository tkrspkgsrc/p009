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
const APIError = require("../../api/APIError");
const { NodePathSelector } = require("../../filesystem/node/selectors");
const { Context } = require("../../util/context");
const BaseService = require("../BaseService");
const { AppUnderUserActorType, UserActorType, Actor, SystemActorType, AccessTokenActorType } = require("./Actor");
const { PermissionUtil } = require("./PermissionService");

class ACLService extends BaseService {
    async _init () {
        const svc_featureFlag = this.services.get('feature-flag');
        svc_featureFlag.register('public-folders', {
            $: 'config-flag',
            value: this.global_config.enable_public_folders ?? false,
        });
    }
    async check (actor, resource, mode) {
        const ld = (Context.get('logdent') ?? 0) + 1;
        return await Context.get().sub({ logdent: ld }).arun(async () => {
            const result =  await this._check_fsNode(actor, resource, mode);
            if ( this.verbose ) console.log('LOGGING ACL CHECK', {
                actor, mode,
                // trace: (new Error()).stack,
                result,
            });
            return result;
        });
    }

    async _check_fsNode (actor, fsNode, mode) {
        const context = Context.get();

        actor = Actor.adapt(actor);

        if ( actor.type instanceof SystemActorType ) {
            return true;
        }

        const path_selector = fsNode.get_selector_of_type(NodePathSelector);
        if ( path_selector && path_selector.value === '/') {
            if (['list','see','read'].includes(mode)) {
                return true;
            }
            return false;
        }
        
        // Hard rule: anyone and anything can read /user/public directories
        if ( this.global_config.enable_public_folders ) {
            const public_modes = Object.freeze(['read', 'list', 'see']);
            let is_public;
            await (async () => {
                if ( ! public_modes.includes(mode) ) return;
                if ( ! (await fsNode.isPublic()) ) return;
                
                const svc_getUser = this.services.get('get-user');
                
                const username = await fsNode.getUserPart();
                const user = await svc_getUser.get_user({ username });
                if ( ! (user.email_confirmed || user.username === 'admin') ) {
                    return;
                }
                
                is_public = true;
            })();
            if ( is_public ) return true;
        }

        // Access tokens only work if the authorizer has permission
        if ( actor.type instanceof AccessTokenActorType ) {
            const authorizer = actor.type.authorizer;
            const authorizer_perm = await this._check_fsNode(authorizer, fsNode, mode);

            if ( ! authorizer_perm ) return false;
        }

        // Hard rule: if app-under-user is accessing appdata directory, allow
        if ( actor.type instanceof AppUnderUserActorType ) {
            const appdata_path = `/${actor.type.user.username}/AppData/${actor.type.app.uid}`;
            const svc_fs = await context.get('services').get('filesystem');
            const appdata_node = await svc_fs.node(new NodePathSelector(appdata_path));

            if (
                await appdata_node.exists() && (
                    await appdata_node.is(fsNode) ||
                    await appdata_node.is_above(fsNode)
                )
            ) {
                console.log('TRUE BECAUSE APPDATA')
                return true;
            }
        }
        
        // app-under-user only works if the user also has permission
        if ( actor.type instanceof AppUnderUserActorType ) {
            const user_actor = new Actor({
                type: new UserActorType({ user: actor.type.user }),
            });
            const user_perm = await this._check_fsNode(user_actor, fsNode, mode);

            if ( ! user_perm ) return false;
        }
        
        // Hard rule: if app-under-user is accessing appdata directory
        //            under a **different user**, allow,
        //            IFF that appdata directory is shared with  user
        //              (by "user also has permission" check above)
        if (await (async () => {
            if ( ! (actor.type instanceof AppUnderUserActorType) ) {
                return false;
            }
            if ( await fsNode.getUserPart() === actor.type.user.username ) {
                return false;
            }
            const components = await fsNode.getPathComponents();
            if ( components[1] !== 'AppData' ) return false;
            if ( components[2] !== actor.type.app.uid ) return false;
            return true;
        })()) return true;

        const svc_permission = await context.get('services').get('permission');

        // const modes = this._higher_modes(mode);
        const modes = [mode];
        let perm_fsNode = fsNode;
        while ( ! await perm_fsNode.get('is-root') ) {
            for ( const mode of modes ) {
                const reading = await svc_permission.scan(
                    actor,
                    `fs:${await perm_fsNode.get('uid')}:${mode}`
                );
                const options = PermissionUtil.reading_to_options(reading);
                if ( options.length > 0 ) {
                    // console.log('TRUE BECAUSE PERMISSION', perm)
                    // console.log(`fs:${await perm_fsNode.get('uid')}:${mode}`)
                    return true;
                }
            }
            perm_fsNode = await perm_fsNode.getParent();
        }

        return false;
    }

    async get_safe_acl_error (actor, resource, mode) {
        const can_see = await this.check(actor, resource, 'see');
        if ( ! can_see ) {
            return APIError.create('subject_does_not_exist');
        }

        return APIError.create('forbidden');
    }

    // If any logic depends on knowledge of the highest ACL mode, it should use
    // this method in case a higher mode is added (ex: might add 'config' mode)
    get_highest_mode () {
        return 'write';
    }

    // TODO: DRY: Also in FilesystemService
    _higher_modes (mode) {
        // If you want to X, you can do so with any of [...Y]
        if ( mode === 'see' ) return ['see', 'list', 'read', 'write'];
        if ( mode === 'list' ) return ['list', 'read', 'write'];
        if ( mode === 'read' ) return ['read', 'write'];
        if ( mode === 'write' ) return ['write'];
    }
}

module.exports = {
    ACLService,
};
