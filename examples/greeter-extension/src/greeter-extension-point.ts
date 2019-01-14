// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, filterByTag, Getter} from '@loopback/context';
import {Greeter} from './types';
import chalk from 'chalk';

/**
 * Options for the greeter extension point
 */
export interface GreeterExtensionPointOptions {
  color: string;
}

/**
 * An extension point for greeters that can greet in different languages
 */
export class GreeterExtensionPoint {
  constructor(
    /**
     * Inject a getter function to fetch greeters (bindings tagged with
     * 'greeter')
     */
    @inject.getter(filterByTag({extensionPoint: 'greeter'}))
    private greeters: Getter<Greeter[]>,
    /**
     * An extension point should be able to receive its options via dependency
     * injection.
     *
     * FIXME (rfeng): A shortcut such as `@inject.config` is desired to avoid
     * the hard-coded binding key
     */
    @inject('greeter-extension-point.options', {optional: true})
    private options?: GreeterExtensionPointOptions,
  ) {}

  /**
   * Greet in the given language
   * @param language Language code
   * @param name Name
   */
  async greet(language: string, name: string): Promise<string> {
    let greeting: string = '';
    // Get the latest list of greeters
    const greeters = await this.greeters();
    // Find a greeter that can speak the given language
    for (const greeter of greeters) {
      if (greeter.language === language) {
        greeting = greeter.greet(name);
        break;
      }
    }
    if (!greeting) {
      // Fall back to English
      greeting = `Hello, ${name}`;
    }
    if (this.options && this.options.color) {
      greeting = chalk.keyword(this.options.color)(greeting);
    }
    return greeting;
  }
}