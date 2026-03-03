#!/usr/bin/env python3
"""
千岛 Design System - Token 处理脚本
用法：python generate.py
将 tokens/ 目录的原始 Figma JSON 处理为 tokens/processed.json
每次从 Figma 重新导出 JSON 后运行一次即可更新页面数据。
"""

import json
import re
import os

BASE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE, 'tokens/Primitives-QD.json'), encoding='utf-8') as f:
    primitives = json.load(f)
with open(os.path.join(BASE, 'tokens/千岛.tokens.json'), encoding='utf-8') as f:
    light_raw = json.load(f)
with open(os.path.join(BASE, 'tokens/千岛暗黑.tokens.json'), encoding='utf-8') as f:
    dark_raw = json.load(f)


def flatten_tokens(data, prefix=''):
    result = {}
    for k, v in data.items():
        if k == '$extensions':
            continue
        full_key = f"{prefix}/{k}" if prefix else k
        if isinstance(v, dict):
            if '$type' in v:
                result[full_key] = v
            else:
                result.update(flatten_tokens(v, full_key))
    return result


def resolve_chain(key, sem_flat, prim_flat_d, max_depth=8):
    chain = [key]
    current = key
    visited = set()
    while current not in visited and len(chain) <= max_depth:
        visited.add(current)
        token = sem_flat.get(current) or prim_flat_d.get(current)
        if not token:
            break
        val = token.get('$value', {})
        if isinstance(val, str) and val.startswith('{') and val.endswith('}'):
            ref = val[1:-1].replace('.', '/')
            chain.append(ref)
            current = ref
        elif isinstance(val, dict) and 'hex' in val:
            return val['hex'], val.get('alpha', 1), chain
        elif isinstance(val, (int, float)):
            return val, 1, chain
        else:
            break
    return None, 1, chain


def group_by_prefix(tokens_dict):
    groups = {}
    for k, v in tokens_dict.items():
        if not isinstance(v, dict) or '$type' not in v:
            continue
        parts = k.rsplit('_', 1)
        clean = re.sub(r'_?\d+$', '', k)
        group_key = clean if len(parts) == 2 else k
        val = v.get('$value', {})
        groups.setdefault(group_key, []).append({
            'key': k,
            'hex': val.get('hex', '') if isinstance(val, dict) else '',
            'alpha': val.get('alpha', 1) if isinstance(val, dict) else 1
        })
    return groups


prim_flat = flatten_tokens(primitives)
light_flat = flatten_tokens(light_raw)
dark_flat = flatten_tokens(dark_raw)

# L1
main_groups = group_by_prefix(primitives.get('Main', {}))
sem_groups = group_by_prefix(primitives.get('Semantics', {}))
radius = {k: v.get('$value') for k, v in primitives.get('Radius', {}).items() if '$type' in v}
spacing = {k: v.get('$value') for k, v in primitives.get('Spacing', {}).items() if '$type' in v}

# L2
l2_cats = {}
for cat_key, cat_val in light_raw.items():
    if cat_key == '$extensions' or not isinstance(cat_val, dict):
        continue
    tokens = []
    for tk, tv in cat_val.items():
        if isinstance(tv, dict) and '$type' in tv:
            full_key = f"{cat_key}/{tk}"
            hex_v, alpha, chain = resolve_chain(full_key, light_flat, prim_flat)
            dark_hex, dark_alpha, _ = resolve_chain(full_key, dark_flat, prim_flat)
            tokens.append({
                'key': full_key, 'name': tk,
                'hex': hex_v, 'alpha': alpha,
                'darkHex': dark_hex, 'darkAlpha': dark_alpha,
                'chain': chain
            })
    if tokens:
        l2_cats[cat_key] = tokens

# L3
l3_data = {}
for comp in ['bt', 'tag']:
    l3_data[comp] = {}
    for cat_key, cat_val in light_raw.items():
        if cat_key == '$extensions' or not isinstance(cat_val, dict):
            continue
        comp_data = cat_val.get(comp)
        if not comp_data or not isinstance(comp_data, dict):
            continue
        tokens = []
        for tk, tv in comp_data.items():
            if isinstance(tv, dict) and '$type' in tv:
                full_key = f"{cat_key}/{comp}/{tk}"
                hex_v, alpha, chain = resolve_chain(full_key, light_flat, prim_flat)
                dark_hex, dark_alpha, _ = resolve_chain(full_key, dark_flat, prim_flat)
                tokens.append({
                    'key': full_key, 'name': tk,
                    'hex': hex_v, 'alpha': alpha,
                    'darkHex': dark_hex, 'darkAlpha': dark_alpha,
                    'chain': chain
                })
        if tokens:
            l3_data[comp][cat_key] = tokens

processed = {
    'main_groups': main_groups,
    'sem_groups': sem_groups,
    'radius': radius,
    'spacing': spacing,
    'l2_cats': l2_cats,
    'l3_data': l3_data
}

out_path = os.path.join(BASE, 'tokens/processed.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(processed, f, ensure_ascii=False, separators=(',', ':'))

size_kb = os.path.getsize(out_path) / 1024
print(f"✓ 生成完成: tokens/processed.json ({size_kb:.1f} KB)")
print(f"  L1: {len(main_groups)} 主色组, {len(sem_groups)} 功能色组")
print(f"  L2: {len(l2_cats)} 语义分类, {sum(len(v) for v in l2_cats.values())} tokens")
print(f"  L3: bt={sum(len(v) for v in l3_data['bt'].values())} tokens, tag={sum(len(v) for v in l3_data['tag'].values())} tokens")
