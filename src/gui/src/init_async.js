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
// Note: this logs AFTER all imports because imports are hoisted
logger.info('start -> async initialization');

import './util/TeePromise.js';
import './util/Component.js';
import './util/Collector.js';
import './UI/Components/Frame.js';
import './UI/Components/Glyph.js';
import './UI/Components/Spinner.js';
import './UI/Components/ActionCard.js';
import './UI/Components/NotifCard.js';
import './UI/Components/TestView.js';
import './UI/Components/JustID.js';
import './UI/UIElement.js';

import putility from '@heyputer/putility';
def(putility, '@heyputer/putility');

logger.info('end -> async initialization');
globalThis.init_promise.resolve();
