# infer.py — extract mesh from trained SDF model using marching cubes

import torch
import numpy as np
import trimesh
from skimage.measure import marching_cubes
from train import SDFMLP

def create_grid(resolution=64, bounds=1.2):
    lin = np.linspace(-bounds, bounds, resolution)
    grid = np.stack(np.meshgrid(lin, lin, lin), -1).reshape(-1, 3)
    return torch.tensor(grid, dtype=torch.float32), (lin, resolution)

def evaluate_sdf(model, coords, batch_size=100000):
    model.eval()
    sdf_values = []
    with torch.no_grad():
        for i in range(0, len(coords), batch_size):
            batch = coords[i:i+batch_size]
            sdf = model(batch).cpu().numpy()
            sdf_values.append(sdf)
    return np.concatenate(sdf_values).reshape((resolution, resolution, resolution))

def save_mesh_from_sdf(sdf_grid, linspace, out_path):
    verts, faces, normals, _ = marching_cubes(sdf_grid, level=0)
    scale = (linspace[0][-1] - linspace[0][0]) / linspace[1]
    verts = verts * scale + linspace[0][0]  # map to real coordinates
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals)
    mesh.export(out_path)
    print(f"Saved mesh to {out_path}")

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=str, required=True, help='Path to .pth model')
    parser.add_argument('--out', type=str, default='output.obj', help='Path to output OBJ')
    parser.add_argument('--res', type=int, default=64, help='Grid resolution')
    args = parser.parse_args()

    global resolution
    resolution = args.res

    model = SDFMLP()
    model.load_state_dict(torch.load(args.model))

    grid, linspace = create_grid(resolution=resolution)
    sdf_grid = evaluate_sdf(model, grid)
    save_mesh_from_sdf(sdf_grid, linspace, args.out)

if __name__ == '__main__':
    main()